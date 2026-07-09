import { compileRegex } from './compileRegex';

interface FieldMaskValidator {
  maskValue?: string;
}

interface StringInspectionValidator {
  stringLength?: number;
  stringMin?: number | string;
  stringMax?: number | string;
}

export type Validators = {
  requiredValidator: (value: string) => boolean;
  emailInspectionValidator: (value: string) => boolean;
  fieldMaskValidator: (value: string, mask: FieldMaskValidator) => boolean;
  stringInspectionValidator: (
    value: string,
    validator: StringInspectionValidator,
  ) => boolean;
  correctPasswordValidator: (value: string, repeatValue: string) => boolean;
};

export const validators: Validators = {
  requiredValidator: (value) => !!value.length,
  emailInspectionValidator: (value) => {
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([a-zA-Z0-9-]+\.)+[a-zA-Z]{1,7}$/;
    return emailRegex.test(value);
  },
  fieldMaskValidator: (value, mask) => {
    const regex = compileRegex(mask?.maskValue ?? '');
    return regex.test(value);
  },
  stringInspectionValidator: (value, validator) => {
    const len = value.length;
    if (validator.stringLength && len === validator.stringLength) {
      return true;
    }
    if (
      validator.stringMax !== undefined &&
      validator.stringMin !== undefined &&
      len <= +validator.stringMax &&
      len >= +validator.stringMin
    ) {
      return true;
    }
    return false;
  },
  correctPasswordValidator: (value, repeatValue) => value === repeatValue,
};
