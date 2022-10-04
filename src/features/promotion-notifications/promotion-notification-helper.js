export const getEffectivePromotionNotifications = (promotionNotifications, promotions) => {
    promotionNotifications.forEach((pn) => {
        const promotion = promotions.find((p) => p._id.toString() === pn.promotionId);
        if (promotion) {
            pn.isActive = true;
        } else {
            pn.isActive = false;
        }
    });

    return promotionNotifications;
};
