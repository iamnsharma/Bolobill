import {Platform} from 'react-native';
import DeviceInfo from 'react-native-device-info';

export const getDeviceHeaders = async () => {
  const deviceId = await DeviceInfo.getUniqueId();
  const deviceName = await DeviceInfo.getDeviceName();

  return {
    'X-Device-Id': deviceId,
    'X-Device-Platform': Platform.OS,
    'X-Device-Name': deviceName,
  };
};
