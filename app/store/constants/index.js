export const JOIN_GAME = 'JOIN_GAME';
export const UPDATE_GAME = 'UPDATE_GAME';
export const ADD_PLAYER_TO_GAME = 'ADD_PLAYER_TO_GAME';
export const RECEIVE_GAMES = 'RECEIVE_GAMES';
export const TOGGLE_OPTIONAL = 'TOGGLE_OPTIONAL';
export const PLAY_LADY_CARD = 'PLAY_LADY_CARD';
export const START_GAME = 'START_GAME';
export const ADD_TO_TEAM = 'ADD_TO_TEAM';
export const REMOVE_FROM_TEAM = 'REMOVE_FROM_TEAM';
export const PROPOSE_TEAM = 'PROPOSE_TEAM';
export const VOTE_ON_TEAM = 'VOTE_ON_TEAM';
export const SCORE_TEAM_VOTES = 'SCORE_TEAM_VOTES';
export const VOTE_ON_QUEST = 'VOTE_ON_QUEST';
export const SCORE_AND_END_QUEST = 'SCORE_AND_END_QUEST';

export const DEFAULT_GAME = {
  hostId: '',
  status: '', // enum: PREGAME, TEAMMAKE, TEAMVOTE, QUESTVOTE, GUESSMERLIN, ENDGAME
  // mordred: false,
  // morgana: false,
  // percival: false,
  // oberon: false,
  currentQuest: 0, // idx in quests array
  currentTurn: 0,  // idx in turnOrder array
  gameId: '',
  approves: 0,
  rejects: 0,
  succeedCards: 0,
  failCards: 0,
  goodScore: 0,
  evilScore: 0,
  rejectCounter: 0,
  proposedTeam: '', // comma delimited playerIds
  turnOrder: '',    // comma delimited playerIds
  merlinGuess: '',
  players: [],
  quests: [{}, {}, {}, {}, {}]
};

export const DEFAULT_QUEST = {
  requiredPlayers: 0,   // === numberOfSuccessesNeeded
  numberOfFailsNeeded: 0,
  result: '' // enum: success, failure
};
