import {COMMAND_STATUS} from "../models/enum";

export class Utils{

  static isEmptyObject(obj: any): boolean {
    return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
  }

  statusCodeToNumber(statusCode: COMMAND_STATUS): number {
    switch (statusCode) {
      case COMMAND_STATUS.validated:
        return 1;
      case COMMAND_STATUS.pending:
        return 2;
      case COMMAND_STATUS.shipped:
        return 3;
      case COMMAND_STATUS.delivered:
        return 4;
      case COMMAND_STATUS.cancelled:
        return 5;
      default:
        return 0;
    }

  }
}
