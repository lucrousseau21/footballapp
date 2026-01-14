export interface Team {
  id: number;
  name: string;
  shortName: string;
  venue: string;
  tla: string;
  crest: string;
  address: string;
  website: string;
  founded: number;
  clubcolors: string;
  lastupdates: string;
}

export interface Player {
  id: number;
  name: string;
  equipe_id: number;
  position: string;
  dateOfBirth: string;
  nationality: string;
}

export interface Coach {
  id: number;
  name: string;
  equipe_id: number;
  nationality: string;
  dateOfBirth: string;
}

// Structure brute depuis Supabase
export interface MatchRaw {
  id: number;
  competition_code: string | null;
  season: number | null;
  utc_date: string;
  status: string;
  matchday: number | null;
  stage: string | null;
  home_team_id: number;
  away_team_id: number;
  home_score: number | null;
  away_score: number | null;
  winner: string | null;
  last_updated: string;
}

// Structure enrichie pour l'affichage
export interface Match {
  id: number;
  utcDate: string;
  status: string;
  matchday?: number;
  homeTeam: {
    id: number;
    name: string;
    shortName?: string;
    crest?: string;
  };
  awayTeam: {
    id: number;
    name: string;
    shortName?: string;
    crest?: string;
  };
  score: {
    fullTime: {
      home?: number;
      away?: number;
    };
    halfTime?: {
      home?: number;
      away?: number;
    };
  };
  competition?: string;
  venue?: string;
}