import Lobby from "./lobby";

const getLobbies = () => {
    return Lobby.find({}).lean().exec();
};

const getLobbyConfigs = async (currencyGroupId) => {
    const lobbies = await getLobbies();
    return lobbies?.find((lobby) => lobby?.currencyGroupIds?.includes(currencyGroupId));
};

export { getLobbyConfigs };
