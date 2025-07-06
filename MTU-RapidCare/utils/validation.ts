// export const ValidationRules = {
//   email: (email: string) => {
//     if (!email) return 'Email is required';
//     if (!email.includes('@')) return 'Invalid email format';
//     return null;
//   },
  
//   hostelName: (name: string) => {
//     if (!name) return 'Hostel name is required';
//     return null;
//   },
  
//   sickness: (condition: string) => {
//     if (!condition) return 'Medical condition is required';
//     return null;
//   }
// };

// export const validateForm = (values: Record<string, string>, rules: Record<string, (value: string) => string | null>) => {
//   const errors: Record<string, string> = {};
  
//   Object.keys(rules).forEach(key => {
//     const error = rules[key](values[key]);
//     if (error) {
//       errors[key] = error;
//     }
//   });
  
//   return {
//     isValid: Object.keys(errors).length === 0,
//     errors
//   };
// }; 