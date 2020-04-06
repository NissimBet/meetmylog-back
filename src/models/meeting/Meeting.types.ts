export interface CreateMeeting
  extends Pick<MeetingData, 'meetingName' | 'creator' | 'members'> {}

export interface UpdateMeeting
  extends Partial<Pick<MeetingData, 'chat' | 'members' | 'sharingId'>>,
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
  chat: Chat[];
  members: string[];
  sharingId: string;
}

/* export const MEETING: MeetingData = {
  chat: [],
  creator: '',
  finishedDate: new Date(),
  meetingId: '',
  meetingName: '',
  members: [],
  ongoing: true,
  sharingId: '',
  startedDate: new Date(),
};
 */
