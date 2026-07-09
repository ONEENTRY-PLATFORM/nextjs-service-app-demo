import type { Dispatch, JSX } from 'react';
import { useEffect } from 'react';
import ReCAPTCHA from 'react-google-recaptcha-enterprise';

/**
 * FormReCaptcha component for handling reCAPTCHA verification.
 * @param   {object}            props              - FormReCaptcha props.
 * @param   {Dispatch<string>}  props.setToken     - Function to set the reCAPTCHA token.
 * @param   {Dispatch<boolean>} props.setIsCaptcha - Function to set the captcha status.
 * @param   {string}            props.captchaKey   - The reCAPTCHA site key.
 * @returns {JSX.Element}                          FormReCaptcha component.
 */
const FormReCaptcha = ({
  setToken,
  setIsCaptcha,
  captchaKey,
}: {
  setToken: Dispatch<string>;
  setIsCaptcha: Dispatch<boolean>;
  captchaKey: string;
}): JSX.Element => {
  /** Set captcha status to true when component mounts */
  useEffect(() => {
    setIsCaptcha(true);
  }, [setIsCaptcha]);

  /* Render Google reCAPTCHA widget */
  return (
    <ReCAPTCHA
      sitekey={captchaKey}
      onChange={(token: string | null) => setToken(token || '')}
      className={'mx-auto'}
      theme="dark"
    />
  );
};

export default FormReCaptcha;
