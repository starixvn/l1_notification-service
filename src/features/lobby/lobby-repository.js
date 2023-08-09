import Lobby from "./lobby";

const getLobbies = () => {
    return Lobby.find({}).lean().exec();
};

const getLobbyConfigs = async (session) => {
    const lobbies = await getLobbies();
    return lobbies?.find((lobby) => lobby?.currencyGroupIds?.includes(session.currencyGroupId));
};

export { getLobbyConfigs };