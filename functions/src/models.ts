export interface JoinLobbyRequest {
    code: string;
}

export interface LeaveLobbyRequest {
    code: string;
}

export enum PlayerProfileRole {
    Thief,
    Detective
}
