const metaDataPath = "metadata/";
const questDataPath = "../data/questData/";
const questImgPath = "../data/questPictures/";
const dataPath = "../data/v2.0/";

const env =
{
	VERCEL: process.env.VERCEL == "true" ? true : false
};

export {env, metaDataPath, questDataPath, questImgPath, dataPath};
