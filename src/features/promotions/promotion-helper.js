const getEffectivePromotionByGame = (promotions) => {
    const promotionPeriods = [];
    promotions.forEach((promotion) => {
        if (promotion.isDaily) {
            const tmpStartTime = new Date(promotion.startDateTime);
            const tmpEndTime = new Date(promotion.endDateTime);
            tmpEndTime.setDate(promotion.startDateTime.getDate());
            tmpEndTime.setMonth(promotion.startDateTime.getMonth());
            tmpEndTime.setFullYear(promotion.startDateTime.getFullYear());
            if (tmpEndTime < promotion.startDateTime) {
                tmpEndTime.setDate(tmpEndTime.getDate() + 1);
            }

            while (tmpEndTime <= promotion.endDateTime) {
                promotionPeriods.push({ start: new Date(tmpStartTime), end: new Date(tmpEndTime), promotion });
                tmpStartTime.setDate(tmpStartTime.getDate() + 1);
                tmpEndTime.setDate(tmpEndTime.getDate() + 1);
            }
        } else {
            promotionPeriods.push({ start: promotion.startDateTime, end: promotion.endDateTime, promotion });
        }
    });

    const currentTime = new Date();
    const effectivePromotion = promotionPeriods.find((p) => p.start <= currentTime && p.end >= currentTime);

    return effectivePromotion?.promotion;
};

export const getEffectivePromotions = (promotions) => {
    const promotionsByGame = {};
    promotions.forEach((p) => {
        if (!promotionsByGame[p.gameId]) {
            promotionsByGame[p.gameId] = [p];
        } else {
            promotionsByGame[p.gameId].push(p);
        }
    });

    const effectivePromotions = [];
    Object.keys(promotionsByGame).forEach((gameId) => {
        const effectivePromotionByGame = getEffectivePromotionByGame(promotionsByGame[gameId]);
        if (effectivePromotionByGame) {
            effectivePromotions.push(effectivePromotionByGame);
        }
    });

    return effectivePromotions;
};
