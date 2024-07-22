import {configureStore, Tuple} from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import rootSaga from './root-saga'
import rootReducer from 'root-reducer'

const sagaMiddleware = createSagaMiddleware()

export const store = configureStore({
	reducer: rootReducer,
	middleware: () => new Tuple(sagaMiddleware),
})

sagaMiddleware.run(rootSaga)

export default store

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
