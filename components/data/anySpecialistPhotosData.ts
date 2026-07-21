/**
 * "Any specialist" team photo per demo salon id (mock `BookingPage.tsx` →
 * `ANY_GROUP`); the booking wizard falls back to Downtown when no salon is
 * chosen.
 */
export const anySpecialistPhotosData: Record<
  'downtown' | 'marina' | 'jbr',
  string
> = {
  downtown: '/images/Any_specialist/Downtown_group.jpg',
  marina: '/images/Any_specialist/Marina_group.jpg',
  jbr: '/images/Any_specialist/JBR_group.jpg',
};
