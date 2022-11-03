import Router from "koa-router";
import {broadcast} from "../utils";
import foodStore from './store';

export const router = new Router();

router.get('/', async (ctx) => {
    const response = ctx.response;
    const userId = ctx.state.user._id;
    response.body = await foodStore.find({userId});
    response.status = 200;
})

router.get('/:id', async (ctx) =>{
    const userId = ctx.state.user._id;
    const food = await foodStore.findOne({_id: ctx.params.id});
    const response = ctx.response;
    if(food){
        if(food.userId === userId){
            response.body = food;
            response.status = 200;
        }
        else{
            response.status = 403;
        }
    }
    else{
        response.status = 404;
    }
});

const createFood = async (ctx, food, response) => {
    try{
        const userId = ctx.state.user._id;
        food.userId = userId;
        console.log(food);
        response.body = await foodStore.insert(food);
        response.status = 201;
        broadcast(userId, {type:'created', payload: food});
    }catch (err){
        response.body = {message: err.message};
        response.status = 400;
    }
}

router.post('/', async ctx => await createFood(ctx, ctx.request.body, ctx.response));

