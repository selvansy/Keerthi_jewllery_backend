import notificationConfigModel from "../infrastructure/models/chit/notificationConfigModel.js";
import topupModel from "../infrastructure/models/chit/topupModel.js";

async function isNotificationEnabled(methodKey) {
    if (!methodKey) {
        return {
            push: false,
            whatsapp: { enabled: false, topupCount: 0 },
            sms: { enabled: false, topupCount: 0 }
        };
    }

    const [config, topupData] = await Promise.all([
        notificationConfigModel.findOne({ active: true }),
        topupModel.findOne({ active: true })
    ]);

    const checkChannelEnabled = (channel) => {
        const channelConfig = config?.[channel];
        return !!(
            channelConfig?.enabled &&
            channelConfig.settings?.schemeWise &&
            channelConfig.settings.schemeWise[methodKey]
        );
    };

    return {
        push: checkChannelEnabled("pushNotification"),
        whatsapp: {
            enabled: checkChannelEnabled("whatsapp"),
            topupCount: topupData?.WhatsApp || 0
        },
        sms: {
            enabled: checkChannelEnabled("sms"),
            topupCount: topupData?.SMS || 0
        }
    };
}

export default isNotificationEnabled;