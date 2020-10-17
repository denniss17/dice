import React, {ChangeEvent, FunctionComponent, useEffect, useRef, useState} from 'react';
import SockJS from 'sockjs-client';
import Stomp, {Client} from 'stompjs';
import './App.scss';

enum Die {
    D6 = "D6"
}

interface DiceThrowIntent {
    name: string,
    dice: Array<Die>
}

interface DiceThrow {
    name: string,
    results: Array<DieResult>
}

interface DieResult {
    die: Die
    result: number
}

interface DiceState {
    d6count: number
}

const App: FunctionComponent = () => {
    const [name, setName] = useState<string>(["Anoniem", "Naamloos", "Ongenoemd", "Onbekend"][Math.floor(Math.random() * 3)]);
    const [dice, setDice] = useState<DiceState>({d6count: 1});
    const [connected, setConnected] = useState<boolean>(false);
    const [client, setClient] = useState<Client | null>(null);
    const [diceThrows, setDiceThrows] = useState<Array<DiceThrow>>([]);

    const diceThrowCallback = useRef<((diceThrow: DiceThrow) => void)>(() => {
    });

    useEffect(() => {
        diceThrowCallback.current = (diceThrow: DiceThrow) => {
            console.info("New throw", diceThrow, diceThrows);
            setDiceThrows([diceThrow, ...diceThrows]);
        };
    }, [diceThrows])

    // Create client on first render
    useEffect(() => {
        const client = Stomp.over(new SockJS('/ws') as WebSocket);

        client.connect({}, function (frame) {
            setConnected(true);
            console.info("Connected: " + frame);
        });

        setClient(client);
    }, []);

    // Create subscription on client connection
    useEffect(() => {
        if (client != null && client.connected) {
            const subscription = client.subscribe('/topic/throws', function (message) {
                const json = JSON.parse(message.body);

                const diceThrow: DiceThrow = {
                    name: json["name"],
                    results: json["result"].map((pair: any) => ({die: pair["first"], result: pair["second"]}))
                }

                diceThrowCallback.current(diceThrow);
            });

            return () => {
                subscription.unsubscribe();
            }
        }
    }, [client, connected])

    function throwDice() {

        const intent: DiceThrowIntent = {
            name,
            dice: Array.from({length: dice.d6count}).map(() => Die.D6)
        }

        if (client != null && client.connected) {
            client.send("/app/throw", {}, JSON.stringify(intent));
        } else {
            console.warn("Not yet connected");
        }
    }

    function clearDiceThrows() {
        setDiceThrows([]);
    }

    function onNameChange(event: ChangeEvent<HTMLInputElement>) {
        setName(event.target.value);
    }

    function onD6CountChange(event: ChangeEvent<HTMLInputElement>) {
        setDice(Object.assign({}, dice, {d6count: event.target.value}));
    }

    return (
        <div className="App">
            <div className="container">
                <div className="row">
                    <div className="col-12 col-lg-6">
                        <div className="card mt-5">
                            <div className="card-body">
                                <h5 className="card-title">Gooien</h5>

                                <form>
                                    <div className="form-group">
                                        <label htmlFor="name">Naam</label>
                                        <input type="text" className="form-control" id="name" value={name}
                                               onChange={onNameChange}/>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="d6Count">Aantal D6</label>
                                        <input type="number" min="1" max="10" className="form-control" id="d6Count"
                                               value={dice.d6count}
                                               onChange={onD6CountChange}/>
                                    </div>
                                    <button onClick={throwDice} disabled={!connected} type="button" className="btn btn-primary">Gooi</button>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-lg-6">
                        <div className="card mt-5">
                            <div className="card-body">
                                <h5 className="card-title">
                                    <span
                                        className={connected ? "badge badge-pill badge-success mr-2" : "badge badge-pill badge-danger mr-2"}>&nbsp;</span>
                                    <span className="mr-auto">Resultaten</span>
                                </h5>

                                <ul className="list-unstyled">
                                    {diceThrows.map((diceThrow, index) =>
                                        <li key={index}>
                                            {diceThrow.name} gooit {diceThrow.results.map(
                                            (dieResult, resultIndex) =>
                                                <span key={resultIndex}
                                                      className="badge badge-light mr-1"><strong>{dieResult.result}</strong></span>
                                        )}
                                        </li>
                                    )}
                                </ul>
                                <button className="btn btn-sm btn-danger ml-auto" type="button"
                                        onClick={clearDiceThrows}>Clear
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
