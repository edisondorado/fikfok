const ApiError = require("../exceptions/api-error");
const searchService = require("../service/search-service");

class SearchController {
    async findAll(req, res, next){
        try{
            const { query } = req.body;
            if (!query) next(ApiError.BadRequest("Search query is required."));

            const [profiles, videos] = await searchService.findAll(query);

            res.status(200).json({ profiles, videos });
        } catch(e){
            next(e);
        }
    }

    async findProfile(req, res, next) {
        try{
            const { query } = req.body;
            if (!query) next(ApiError.BadRequest("Search query is required."));

            const profiles = await searchService.findProfile(query);
        
            res.status(200).json({ profiles })
        } catch(e){
            next(e);
        }
    }

    async findVideo(req, res, next) {
        try{
            const { query } = req.body;
            if (!query) next(ApiError.BadRequest("Search query is required."));

            const videos = await searchService.findVideo(query);

            res.status(200).json({ videos })
        } catch(e){
            next(e);
        }
    }
}

module.exports = new SearchController();