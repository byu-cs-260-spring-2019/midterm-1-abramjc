let app = new Vue({
    el: "#content",
    data: {
        searchField: '',
        response: {},
        favorites: [],
        bookList: [],

        loading: false,
        loaded: false,


    },

    methods: {
        async searchBooks() {
            if (this.searchField === '') {
                return;
            }

            let entries = this.searchField.split(' ');

            let url = 'http://openlibrary.org/search.json?q=';

            for (i in entries) {
                url += entries[i] + "+";
            }
            url = url.slice(0, -1);

            try {
                this.loading = true;
                let response = await axios.get(url);
                this.response = response.data;
                await this.processResponse();
                this.loading = false;
                
                this.loaded = true; 
            }
            catch (err) {
                console.log(err);
            }


        },

        async processResponse() {
            for (book in this.response.docs) {
                let newBook = [];
                newBook.push(await this.getImage(book));
                let info = [];

                if (this.response.docs[book].title !== undefined) {
                    info.push("Title: " + this.response.docs[book].title);
                }
                
                if (this.response.docs[book].author_name !== undefined) {
                    info.push("Author: " + this.response.docs[book].author_name[0]);
                }

                if (this.response.docs[book].publish_date !== undefined) {
                    info.push("Published: " + this.response.docs[book].publish_date[0]);
                }

                newBook.push(info);

                Vue.set(app.bookList, book, newBook);
                
            }
        },

        async getImage(bookIndex) {
            let isbn = this.response.docs[0].isbn;

            if (isbn === undefined) {
                return "";
            }

            isbn = isbn[0]

            let url = 'https://openlibrary.org/api/books?bibkeys=ISBN:' + isbn + '&jscmd=details&format=json';

            let response = await axios.get(url);


            if (response.data['ISBN:' + isbn].thumbnail_url === undefined)
                return "";

            return response.data['ISBN:' + isbn].preview_url;

        },

        addToFavorites(index) {
            this.favorites.push(this.bookList[index]);
        }
    },

});
