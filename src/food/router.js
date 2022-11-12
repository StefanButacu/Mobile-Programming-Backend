import Router from "koa-router";
import {broadcast} from "../utils";
import foodStore from './store';
import fs from "fs";


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
        response.body = await foodStore.insert(food);
        response.status = 201;
        broadcast(userId, {type:'created', payload: food});
    }catch (err){
        response.body = {message: err.message};
        response.status = 400;
    }
}

router.post('/', async ctx => await createFood(ctx, ctx.request.body, ctx.response));


router.post('/photo', async ctx => {
    const photo = ctx.request.body.data;
    let buff = Buffer.from(photo, 'base64');
    fs.writeFile('my-file.png', buff, (err) => {
        if (err) throw err;
        console.log('The binary data has been decoded and saved to my-file.png');
    });
    ctx.response.status = 200
})


router.put('/:id', async (ctx) => {
    const item = ctx.request.body;
    const id = ctx.params.id;
    const itemId = item._id;
    const response = ctx.response;
    if (itemId && itemId != id) {
        response.body = { message: 'Param id and body _id should be the same' };
        response.status = 400; // bad request
        return;
    }
    if (!itemId) {
        await createFood(ctx, item, response);
    } else {
        const userId = ctx.state.user._id;
        item.userId = userId;
        const updatedCount = await foodStore.update({ _id: id }, item);
        if (updatedCount === 1) {
            response.body = item;
            response.status = 200; // ok
            broadcast(userId, { type: 'updated', payload: item });
        } else {
            response.body = { message: 'Resource no longer exists' };
            response.status = 405; // method not allowed
        }
    }
});

