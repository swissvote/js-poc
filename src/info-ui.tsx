import * as T from "./type";
import * as CryptoHelper from "./crypto-helper";

const InfoUI = ({ info }: { info: T.Info }) => {
  return (
    <>
      <h2 className="text-2xl">{info.title}</h2>
      <p className="text-xs">
        <code>{CryptoHelper.firstAndLastChars(info.publicKeyString, 25)}</code>
      </p>
    </>
  );
};

export default InfoUI;
