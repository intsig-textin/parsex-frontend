/**
 * 获取图片orientation
 * @param {blob} blob
 * @returns {Number} 1 | 3 | 6 | 8
 */
export default function getOrientationFn(blob: Blob): Promise<number> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(blob);
    reader.onload = () => {
      function getStringFromCharCode(dataView: DataView, start: number, len: number) {
        let length = len;
        let str = '';
        let i;
        for (i = start, length += start; i < length; i += 1) {
          str += String.fromCharCode(dataView.getUint8(i));
        }
        return str;
      }
      try {
        const arrayBuffer = reader.result;
        const dataView = new DataView(arrayBuffer as ArrayBuffer);
        let length = dataView.byteLength;
        let orientation;
        let exifIDCode;
        let tiffOffset;
        let firstIFDOffset;
        let littleEndian;
        let endianness;
        let app1Start;
        let ifdStart;
        let offset;
        let i;
        // Only handle JPEG image (start by 0xFFD8)
        if (dataView.getUint8(0) === 0xff && dataView.getUint8(1) === 0xd8) {
          offset = 2;
          while (offset < length - 1) {
            if (dataView.getUint8(offset) === 0xff && dataView.getUint8(offset + 1) === 0xe1) {
              app1Start = offset;
              break;
            }
            offset += 1;
          }
        }
        if (app1Start) {
          exifIDCode = app1Start + 4;
          tiffOffset = app1Start + 10;
          if (getStringFromCharCode(dataView, exifIDCode, 4) === 'Exif') {
            endianness = dataView.getUint16(tiffOffset);
            littleEndian = endianness === 0x4949;

            if (littleEndian || endianness === 0x4d4d /* bigEndian */) {
              if (dataView.getUint16(tiffOffset + 2, littleEndian) === 0x002a) {
                firstIFDOffset = dataView.getUint32(tiffOffset + 4, littleEndian);

                if (firstIFDOffset >= 0x00000008) {
                  ifdStart = tiffOffset + firstIFDOffset;
                }
              }
            }
          }
        }
        if (ifdStart) {
          length = dataView.getUint16(ifdStart, littleEndian);

          for (i = 0; i < length; i += 1) {
            offset = ifdStart + i * 12 + 2;
            if (dataView.getUint16(offset, littleEndian) === 0x0112 /* Orientation */) {
              // 8 is the offset of the current tag's value
              offset += 8;

              // Get the original orientation value
              orientation = dataView.getUint16(offset, littleEndian);

              break;
            }
          }
        }
        resolve(orientation || 0);
      } catch (error) {
        console.log('getOrientation-error', error);
        resolve(0);
      }
    };
  });
}
