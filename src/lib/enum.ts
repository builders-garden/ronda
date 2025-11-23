export enum MainPageContent {
  HOME = "HOME",
  CIRCLES = "CIRCLES",
  PROFILE = "PROFILE",
}

export type PageContent = {
  content: MainPageContent;
};

export interface CirclesPageContent extends PageContent {
  circleAddress: string;
}

export enum RondaStatus {
  DEPOSIT_DUE = "DEPOSIT_DUE",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
}

export enum Frequency {
  WEEKLY = "weekly",
  BIWEEKLY = "biweekly",
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
}

export enum Genders {
  ALL = "ALL",
  MALE = "M",
  FEMALE = "F",
}

export enum VerificationType {
  NONE = 0, // No verification required
  SELF_BASE = 1, // Proof of personhood only
  SELF_AGE = 2, // Proof of personhood + age verification
  SELF_NATIONALITY = 3, // Proof of personhood + nationality verification
  SELF_GENDER = 4, // Proof of personhood + gender verification
  SELF_AGE_NATIONALITY = 5, // Proof of personhood + age + nationality
  SELF_AGE_GENDER = 6, // Proof of personhood + age + gender
  SELF_NATIONALITY_GENDER = 7, // Proof of personhood + nationality + gender
  SELF_ALL = 8, // Proof of personhood + age + nationality + gender
}
