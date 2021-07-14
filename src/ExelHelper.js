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
  if (
    newPhanTo == hadPhanTo &&
    (newChiTieu?.includes(hadChiTieu) || hadChiTieu?.includes(newChiTieu))
  ) {
    return true;
  }
  return false;
};

export const checkDuLieu = (nextRow) => {
  if (nextRow.col4 === undefined && nextRow.col4 === null) {
    return false;
  }
  if (typeof nextRow.col4 !== "string") {
    return false;
  }
  if (
    nextRow?.col4?.includes("ngày") &&
    nextRow?.col4?.includes("tháng") &&
    nextRow?.col4?.includes("năm")
  ) {
    return false;
  }
  if (
    nextRow.col1 === undefined &&
    nextRow.col4.includes("Hà Nội, ngày") == false
  ) {
    return true;
  }
  return true;
};
