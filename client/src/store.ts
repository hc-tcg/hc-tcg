import {createStore, applyMiddleware, compose} from 'redux'
import createSagaMiddleware from 'redux-saga'
import rootSaga from './root-saga'
import rootReducer from './root-reducer'

export const sagaMiddleware = createSagaMiddleware()
const composeEnhancers =
	(window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
export const store = createStore(
	rootReducer,
	composeEnhancers(applyMiddleware(sagaMiddleware))
)
sagaMiddleware.run(rootSaga)

export default store

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
