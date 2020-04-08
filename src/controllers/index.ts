import { UserController } from './user/User.Controller';
import { MeetingController } from './meeting/Meeting.Controller';
import { GroupController } from './group/Group.Controller';

// instanciar cada controlador y exportarla
export const userController = new UserController();
export const meetingController = new MeetingController();
export const groupController = new GroupController();
