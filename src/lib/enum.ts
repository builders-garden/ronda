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
