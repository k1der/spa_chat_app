(function(){

    var socket = io();

    // Message Component
    Vue.component('message' , {
        props: ['messageData', 'userId'],
        template: ` <div class="media-content">
                        <div class="content">
                            <p>
                                <strong v-if="messageData.userId === userId">Vous</strong>
                                <strong v-else>{{messageData.userName}}</strong>
                                <small>{{messageData.date}}</small>
                                <br>
                                {{messageData.text}}
                            </p>
                        </div>
                    </div>`
    });

    // Input message Component
    Vue.component('input-message' , {
        data: function() {
            return {
                message: ''
            }
        },
        template: ` <div class="" style="width:100%;">
                        <div class="input-group">
                            <input
                             v-model="message"
                             v-on:keydown.enter="send"
                             class="form-control"
                             style="border-top-left-radius:0px;"
                             placeholder="Ecrivez un message"
                            >
                            <span class="input-group-btn">
                                <button
                                 v-on:click="send"
                                 :disabled="!message"
                                 class="btn btn-primary"
                                 style="border-top-right-radius:0px;"
                                >
                                    Envoyer
                                </button>
                            </span>
                        </div>
                    </div>`,
        methods: {
            send: function() {
                if(this.message.length > 0){
                    this.$emit('send-message', this.message);
                    this.message = '';
                }
            }
        }
    });

    // Input user name Component
    Vue.component('input-name' , {
        props: ['isLogged'],
        data: function() {
            return {
                userName: ''
            }
        },
        template: `<div
                    id="nameInput"
                    v-show="!isLogged"
                    >
                        <div class="col-md-12">
                            <div class="input-group">
                                <input
                                 v-model="userName"
                                 v-on:keydown.enter="sendUserName"
                                 class="form-control"
                                 placeholder="Votre prénom"
                                >
                                <span class="input-group-btn">
                                    <button
                                     v-on:click="sendUserName"
                                     :disabled="!userName"
                                     class="btn btn-default"
                                    >
                                        Entrer
                                    </button>
                                </span>
                            </div>
                        </div>
                    </div>`,
        methods: {
            sendUserName: function() {
                if(this.userName.length > 0){
                    this.$emit('set-name', this.userName);
                }
            }
        }
    });

    // Users component
    Vue.component('users' , {
        props: ['users'],
        template: ` <div>
                        <ul class="list-group">
                            <li class="list-group-item active">
                                Utilisateurs connectés <span class="badge">{{users.length}}</span>
                            </li>
                            <li v-for="user in users"
                            class="list-group-item"
                            >
                                {{user.name}}
                            </li>
                        </ul>
                    </div>`
    });

    // Vue instance
    var app = new Vue({
        el: '#app',
        data: {
            messages: [],
            users: [],
            userName: '',
            isLogged: false,
            uuid: null,
        },
        methods: {
            sendMessage: function(message) {
                if(message){
                    socket.emit('send-msg', {message: message, user: this.userName, uuid: this.uuid});
                }
            },
            setName: function(userName) {
                this.userName = userName;
                this.uuid = this.uuidv4();
                this.isLogged = true;
                socket.emit('add-user', { userName: this.userName, uuid: this.uuid});
            },
            scrollToEnd: function() {
                var container = this.$el.querySelector("#messages");
                container.scrollTop = container.scrollHeight;
            },
            uuidv4: function () {
                return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
                  (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
                );
            },
        },
        updated(){
            this.scrollToEnd();
        },
    });

    // Client Socket events

    // When the server emits a message, the client updates message list
    socket.on('read-msg', function(message){
        app.messages.push({text : message.text, userName : message.userName, userId : message.userId, date : message.date});
    });

    // Init chat event. Updates the initial chat with current messages
    socket.on('init-chat', function(messages){
        app.messages = messages;
    });

    // Init user list. Updates user list when the client init
    socket.on('update-users', function(users){
        app.users = users;
    });

})();
