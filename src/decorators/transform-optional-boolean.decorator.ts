import { Transform } from 'class-transformer';

export const TransformOptionalBoolean = () =>
  Transform((e) => {
    switch (e.value) {
      case 'true':
        return true;
      case 'false':
        return false;
      //boolean to boolean cases only if using transform: true with validationPipe (will call this decorator twice then)
      case true:
        return true;
      case false:
        return false;
      default:
        return undefined;
    }
  });
