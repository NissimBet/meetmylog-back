export interface CreateMeeting
  extends Pick<
    MeetingData,
    'meetingName' | 'creator' | 'members' | 'groupId'
  > {}

export interface UpdateMeeting
  extends Partial<Pick<MeetingData, 'chat' | 'members' | 'isPublic'>>,
    Pick<MeetingData, 'meetingId'> {}

export interface Chat {
  from: string;
  timeSent: Date;
  message: string;
}

export interface MeetingData {
  meetingName: string;
  meetingId: string;
  startedDate: Date;
  finishedDate: Date;
  ongoing: boolean;
  creator: string;
  groupId?: string;
  chat: Chat[];
  members: string[];
  isPublic: boolean;
}
