const request = require('supertest');
const app = require('../../app');
const { mongoConnect, mongoDisconnect } = require('../../services/mongo');
//const { loadPlanetData } = require('../../models/planets.model');

describe('Launches API', () => {
    beforeAll(async () => {
        await mongoConnect();
        //await loadPlanetData();
    });

    afterAll(async () => {
        await mongoDisconnect();
    });


    describe('Test GET /launches', () => {
        test('It should respond with 200 success', async () => {
            const response = await request(app)
                .get('/launches')
                .expect('Content-Type', /json/)
                .expect(200);
        });
    });
    
    describe('Test POST /launches',  () => {
        const completeLaunchData = {
            mission:'SYR Space',
            rocket: 'Shaheen',
            target:'Kepler-62 f',
            launchDate:'January 4, 2028',
        }
    
        const launchDataWithoutDate = {
            mission:'SYR Space',
            rocket: 'Shaheen',
            target:'Kepler-62 f',
        }
    
        const launchDataWithInvalidDate = {
            mission:'SYR Space',
            rocket: 'Shaheen',
            target:'Kepler-62 f',
            launchDate:'Hi there',
        }
    
        test('It should respond with 201 created',async () => {
            const response = await request(app)
                .post('/launches')
                .send(completeLaunchData)
                .expect('Content-Type', /json/)
                .expect(201);
    
            const requestDate = new Date(completeLaunchData.launchDate).valueOf();
            const responseDate = new Date(response.body.launchDate).valueOf();
            expect(responseDate).toBe(requestDate);
                
            expect (response.body).toMatchObject(launchDataWithoutDate); // to check if one object contains a certain set of properties
        });
    
        test('It should catch missing required properties', async() => {
            const response = await request(app)
                .post('/launches')
                .send(launchDataWithoutDate)
                .expect('Content-Type', /json/)
                .expect(400);
            
            expect(response.body).toStrictEqual({  // toStrictEqual to match an object exactly
                error: 'Missing required launch property',
            })    
        });
        test('It should catch invalid dates', async () => {
            const response = await request(app)
                .post('/launches')
                .send(launchDataWithInvalidDate)
                .expect('Content-Type', /json/)
                .expect(400);
            
            expect(response.body).toStrictEqual({ 
                error: 'Invalid launch Date',
            }) 
        });
    })
});


