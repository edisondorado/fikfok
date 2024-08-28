const { VideoSchema } = require("../database/model");

class ScheduleService {
    async uploadScheduledVideo(){
        let scheduledVideos = await VideoSchema.find({ "schedule.isSchedule": true, visibility: "private" });
        scheduledVideos = scheduledVideos.filter(video => new Date(video.schedule.date) <= new Date());

        for (const video of scheduledVideos) {
            video.visibility = video.schedule.visibility;
            video.time = new Date();
            await video.save();
        }
    }
}

module.exports = new ScheduleService();