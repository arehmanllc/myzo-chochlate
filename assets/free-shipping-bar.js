/**
 * Free Shipping Bar Dynamic Update
 * Listens for cart updates and refreshes the bar on the product page and cart drawer.
 */

if (!customElements.get('free-shipping-bar')) {
    class FreeShippingBar extends HTMLElement {
        constructor() {
            super();
            this.container = this.querySelector('.shipping-bar__container');
        }

        connectedCallback() {
            if (typeof subscribe === 'function') {
                this.cartUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.cartUpdate, (event) => {
                    this.onCartUpdate(event);
                });
            }
        }

        disconnectedCallback() {
            if (this.cartUpdateUnsubscriber) {
                this.cartUpdateUnsubscriber();
            }
        }

        onCartUpdate(event) {
            const cartData = event.cartData;

            // If we have the total price in the event (from /cart/change.js or /cart/update.js)
            if (cartData && typeof cartData.total_price !== 'undefined') {
                this.syncUpdate(cartData.total_price);
                return;
            }

            // If we don't have the total (e.g. from /cart/add.js), fetch the full cart
            fetch(`${window.routes.cart_url}.js`)
                .then((response) => response.json())
                .then((cart) => {
                    this.syncUpdate(cart.total_price);
                });
        }

        syncUpdate(totalPrice) {
            // Coordination: If this bar is NOT in the drawer, wait a moment 
            // so the drawer bar (which is being re-rendered by the server) can update first.
            const isInDrawer = this.closest('cart-drawer');
            const delay = isInDrawer ? 0 : 200;

            setTimeout(() => {
                this.updateBar(totalPrice);
            }, delay);
        }

        formatMoney(cents, format) {
            if (typeof cents === 'string') cents = cents.replace('.', '');
            let value = '';
            const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
            const formatString = format || "${{amount}}";

            function formatWithDelimiters(number, precision, thousands, decimal) {
                precision = precision || 2;
                thousands = thousands || ',';
                decimal = decimal || '.';

                if (isNaN(number) || number == null) return 0;

                number = (number / 100.0).toFixed(precision);

                const parts = number.split('.');
                const dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
                const centsAmount = parts[1] ? decimal + parts[1] : '';

                return dollarsAmount + centsAmount;
            }

            switch (formatString.match(placeholderRegex)[1]) {
                case 'amount':
                    value = formatWithDelimiters(cents, 2);
                    break;
                case 'amount_no_decimals':
                    value = formatWithDelimiters(cents, 0);
                    break;
                case 'amount_with_comma_separator':
                    value = formatWithDelimiters(cents, 2, '.', ',');
                    break;
                case 'amount_no_decimals_with_comma_separator':
                    value = formatWithDelimiters(cents, 0, '.', ',');
                    break;
                default:
                    value = formatWithDelimiters(cents, 2);
            }

            return formatString.replace(placeholderRegex, value);
        }

        updateBar(totalPrice) {
            if (!this.container) return;

            const threshold = parseInt(this.container.getAttribute('data-free-shipping-threshold'));
            const successText = this.container.getAttribute('data-success-text');
            const beforeSuccessText = this.container.getAttribute('data-before-success-text');
            const successColor = this.container.getAttribute('data-success-color');
            const progressColor = this.container.getAttribute('data-progress-color');

            const progressPercentage = Math.min((totalPrice * 100) / threshold, 100);
            const isFree = totalPrice >= threshold;

            // Update Text
            const textElement = this.querySelector('p');
            if (textElement) {
                if (isFree) {
                    textElement.innerHTML = successText;
                    textElement.classList.add('b-500');
                } else {
                    const remaining = threshold - totalPrice;
                    const format = window.cartStrings?.money_format || "${{amount}}";
                    const remainingFormatted = (typeof Shopify !== 'undefined' && Shopify.formatMoney)
                        ? Shopify.formatMoney(remaining, format)
                        : this.formatMoney(remaining, format);

                    const remainingHtml = `<span>${remainingFormatted}</span>`;
                    textElement.innerHTML = beforeSuccessText.replace('amount_price', remainingHtml);
                    textElement.classList.remove('b-500');
                }
            }

            // Update Bar
            const progressBar = this.querySelector('.prog-bar__bar-value');
            if (progressBar) {
                progressBar.style.setProperty('--width', `${progressPercentage}%`);
                progressBar.style.setProperty('--bg-color', isFree ? successColor : progressColor);
            }
        }
    }

    customElements.define('free-shipping-bar', FreeShippingBar);
}
