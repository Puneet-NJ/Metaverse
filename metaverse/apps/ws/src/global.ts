import { WebSocket } from "ws";
import { ElementInfo, Space, WSC_Info } from "./types";

export const SPACES = new Map<string, Space>();
export const ELEMENTS = new Map<string, ElementInfo>();
export const WSC = new Map<WebSocket, WSC_Info>();
export const WSC_SPACE = new Map<string, WebSocket[]>();
