/**
 * ReviewPhoto — one photo attached to a review while the dialog is open.
 *
 * The thumbnail strip needs an object URL to render, and the submission needs
 * the original `File` (the SDK uploads it as part of the `groupOfImages` field),
 * so both travel together instead of the dialog keeping two parallel arrays.
 * @property {string} url  - Object URL used by the thumbnail, revoked on removal
 * @property {File}   file - Original file, uploaded with the review
 */
export type ReviewPhoto = {
  url: string;
  file: File;
};
