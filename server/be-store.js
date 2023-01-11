import {createStore, applyMiddleware} from 'redux'
import createSagaMiddleware from 'redux-saga'
import {fork} from 'redux-saga/effects'
import rootSaga from './routines/root'

const sagaMiddleware = createSagaMiddleware()

const store = createStore(() => {}, applyMiddleware(sagaMiddleware))

sagaMiddleware.run(rootSaga)

export default store
