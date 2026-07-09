export enum CurrencyEnum {
  en = 'USD',
  fr = 'EUR',
}

export enum IntlEnum {
  en = 'en-US',
  fr = 'fr-FR',
}

/**
 * Language codes mapping
 */
export enum LanguageEnum {
  en = 'en_US',
  fr = 'fr_FR',
}

export enum Sizes {
  xs = 480,
  sm = 640,
  md = 768,
  lg = 1024,
  xl = 1240,
  xxl = 1536,
}

export enum ConditionMarkersEnum {
  IN = 'in',
  NIN = 'nin',
  EQ = 'eq',
  NEQ = 'neq',
  MTH = 'mth',
  LTH = 'lth',
  EXS = 'exs',
  NEXS = 'nexs',
}

export enum FormFieldsEnum {
  string = 'text',
  email = 'email',
  password = 'password',
  phone = 'tel',
  date = 'date',
  text = 'textarea',
  list = 'list',
  spam = 'spam',
  button = 'button',

  email_reg = email,
  email_notifications = email,
  phone_reg = phone,
  password_reg = password,
  password_confirm = password,
  card_cvc = password,
}

export enum minLengthFieldsEnum {
  card_cvc = 3,
}

export enum maxLengthFieldsEnum {
  card_cvc = 3,
}
