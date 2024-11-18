import { createTag } from '../../../scripts/utils.js';

const CLASS_HIDDEN = 'is-hidden';
const SELECTOR_PREFIX_MESSAGE = '.error-message-';
class Checkbox {
    constructor(formEl, config) {
        this.form = formEl;
        this.fieldConfig = config;
        this.checkboxInput = this.createCheckbox();
        this.id = this.checkboxInput.id;
        this.name = this.checkboxInput.name;
        this.type = this.checkboxInput.getAttribute('type');
        this.required = !!(this.checkboxInput.hasAttribute('data-required'));
        this.value = this.checkboxInput.value;
        this.valid = true;
        this.init();
    }

    init() {
        this.form.addEventListener('checkValidation', () => this.isValid());
        this.checkboxInput.addEventListener('change', () => this.isValid());
    }

    createCheckbox() {
      const i = createTag('input', { type: 'checkbox', class: 'cc-form-component check-item-input checkbox-input'});
      const checkWrap = createTag('div', { class: 'check-item-wrap checkbox-input-wrap' }, i);
      const checkIcon = createTag('span', { class: 'check-item-button checkbox-button'});
      checkWrap.append(checkIcon);
      const d = createTag('div', { class: 'form-item' }, checkWrap);
      this.form.append(d);
      const cfgKeys = this.setTypeAttributes(i);
      [...cfgKeys].forEach((ckraw) => {
        const ck = ckraw.toLowerCase();
        switch(ck) {
          case 'label':
            const ltxt = this.fieldConfig[ck].innerText.trim();
            const l = createTag('label', { class: 'check-item-label checkbox-label' }, ltxt);
            checkWrap.append(l);
            i.setAttribute('aria-label', ltxt);
            break;
          case 'checked':
            i.setAttribute('checked', 'checked');
            break;
          case 'optional':
            i.removeAttribute('required');
            i.removeAttribute('data-required');
            break;
          case 'error-required':
            const er = createTag('div', { class: `field-detail ${CLASS_HIDDEN} error-message error-message-required` }, this.fieldConfig[ck].innerText.trim());
            d.append(er);
            break;
        }
      });
      return i;
    }

    setTypeAttributes(i) {
      const fieldType = this.fieldConfig.type.split('cc-form-checkbox-').pop();
      switch(fieldType) {
        case 'consent-explicit-email':
          i.setAttribute('name', 'consentexplicitemail');
          i.setAttribute('id', 'consentexplicitemail');
          break;
        case 'consent-explicit-phone':
          i.setAttribute('name', 'consentexplicitphone');
          i.setAttribute('id', 'consentexplicitphone');
          break;
        case 'consent-soft':
          i.setAttribute('name', 'consentsoft');
          i.setAttribute('id', 'consentsoft');
          break;
        default:
          i.setAttribute('name', fieldType);
          i.setAttribute('id', fieldType);
          break;
      }
      const cfgKeys = Object.keys(this.fieldConfig);
      i.setAttribute('required', 'required');
      i.setAttribute('data-required', 'required');
      return cfgKeys;
    }

    showMessage(type) {
        const elem = this.checkboxInput.closest('.form-item').querySelector(`${SELECTOR_PREFIX_MESSAGE}${type}`);
        if (elem) elem.classList.remove(CLASS_HIDDEN);
    }

    hideMessage(type) {
        const elem = this.checkboxInput.closest('.form-item').querySelector(`${SELECTOR_PREFIX_MESSAGE}${type}`);
        if (elem) elem.classList.add(CLASS_HIDDEN);
    }

    isValid() {
        this.valid = false;
        if (!this.required) this.valid = true;
        if (this.required && this.checkboxInput.checked) this.valid = true;
        this.checkboxInput.setAttribute('data-valid', this.valid);
        this.hideMessage('required');
        if (!this.valid) this.showMessage('required');
        return this.valid;
    }
}

export default Checkbox;