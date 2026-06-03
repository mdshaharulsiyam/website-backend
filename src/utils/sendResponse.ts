import { Response } from "express";

export const sendResponse = (
  res: Response,
  status: number,
  data?: any,
  token?: [string, string, number?],
) => {
  token && token?.length > 1
    ? res
        .cookie(token[0], token[1], {
          maxAge: token[2] || 60 * 60 * 24 * 1000,
          httpOnly: true,
          sameSite: "none",
          secure: false,
        })
        .status(status)
        .send(data)
    : res.status(status).send(data);
};
