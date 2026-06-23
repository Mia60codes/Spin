export interface Sector {
  id: number;
  label: string;
  color: string;
  textColor: string;
  odds: string;
  badge?: string;
}

export interface AppSettings {
  whatsappNumber: string;
  customMessageTemplate: string;
  vipComboTemplate: string;
  customHostName: string;
  enableSoundEffects: boolean;
}

export interface MatchPrediction {
  id: string;
  time: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  prediction: string;
  odds: number;
}
