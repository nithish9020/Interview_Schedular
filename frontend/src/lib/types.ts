export const UserRole = {
  INTERVIEWER: "INTERVIEWER",
  APPLICANT: "APPLICANT",
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]
