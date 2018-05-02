import React from 'react';
import './main.scss';
import io from 'socket.io-client';
import Spinner from 'react-md-spinner';


export default class MainContainer extends React.Component {
    constructor(props) {
        super(props);
        this._startUpload = this._startUpload.bind(this);
        this._fileChosen = this._fileChosen.bind(this);
        this._socket = io.connect('http://localhost:8000');
        this._socket.on('connect', data => {

        });

        this.state = {
            waitAreaStatus: '',
            isUploadAreaHidden: false,
        };
    }

    componentDidMount() {

    }

    render() {
        return (
            <div id='main-content'>
                <div id='upload-area' className={this.state.isUploadAreaHidden ? 'hidden' : ''}>
                    <span>
                        <input type='file' id='file-box' onChange={this._fileChosen}/><br/>
                        <button type='button' id='upload-button' className='button'
                                onClick={this._startUpload}>Загрузить</button>
                    </span>
                </div>
                <div id='wait-area' className={this.state.isUploadAreaHidden ? '' : 'hidden'}>
                    <Spinner size={70}/>
                    <h3>{this.state.waitAreaStatus}</h3>
                </div>
            </div>
        )
    }

    _startUpload() {
        if (this._file) {
            this.setState({
                isUploadAreaHidden: true
            });

            const fileReader = new FileReader();

            fileReader.onload = event => {
                this._socket.emit('upload', {
                    name: this._name,
                    data: event.target.result
                });
            };

            this._socket.emit('start', {
                name: this._name,
                size: this._file.size
            });

            this._socket.on('moreData', data => {
                const percent = data.percent;
                this.setState({
                    waitAreaStatus: `Загружено ${Math.floor(percent)}%`
                });

                const place = data.place * 524288;
                const newFile = this._file.slice(place, place + Math.min(524288, (this._file.size - place)));

                fileReader.readAsBinaryString(newFile);
            });

            this._socket.on('finishUpload', data => {
                this.setState({
                    waitAreaStatus: `Видео полностью загружено, начинаем анализ`
                });
            });
        } else {
            alert('Сперва выберите файл');
        }
    }

    _fileChosen(e) {
        this._file = e.target.files[0];
        const splitName = this._file.name.split('.');
        this._name = `file-name-${Math.random()}.${splitName[splitName.length - 1]}`;
    }
}