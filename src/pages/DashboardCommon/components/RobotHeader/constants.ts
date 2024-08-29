/**
 * @name 判断该机器人是否为免费使用机器人
 * @param service 机器人 service
 */
const FREE_ROBOT_SERVICE = [''];

export const isFreeRobot = (service?: string) => service && FREE_ROBOT_SERVICE.includes(service);
