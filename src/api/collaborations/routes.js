const routes = (handler) => [
    {
        method: 'POST',
        path: '/collaborations',
        handler: (request, h) => handler.postCollaborationHandler(request, h),
        options: {
            auth: 'openmusicapi_jwt',
        },
    },
    {
        method: 'DELETE',
        path: '/collaborations',
        handler: (request) => handler.deleteCollaborationHandler(request),
        options: {
            auth: 'openmusicapi_jwt',
        },
    },
];

module.exports = routes;
