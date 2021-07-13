/* eslint-disable eqeqeq */
export const getSheetNameContainOriginName = (sheets, name = "fileread") => {
  let sheetNameFounded = null;
  sheets.forEach((sheetName) => {
    if (sheetName.includes(name)) {
      sheetNameFounded = sheetName;
    }
  });
  return sheetNameFounded;
};

export const convertDataChuan = (soCanConvert) => {
  if (soCanConvert == undefined || soCanConvert == null) {
    return 0;
  }

  if (typeof soCanConvert == "string") {
    let soParse = parseFloat(soCanConvert);
    if (isNaN(soParse)) {
      return soCanConvert;
    }
    return soParse;
  }
  return soCanConvert;
};

export const checkTrungChiTieu = (
  hadChiTieu,
  hadPhanTo,
  newChiTieu,
  newPhanTo
) => {
  if (newChiTieu == hadChiTieu && newPhanTo == hadPhanTo) {
    return true;
  }
  return false;
};
