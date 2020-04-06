export interface GroupData {
  groupId: string;
  name: string;
  creator: string;
  members: string[];
  meetings: string[];
}

export interface CreateGroup {
  name: string;
  creator: string;
  members: string[];
}
