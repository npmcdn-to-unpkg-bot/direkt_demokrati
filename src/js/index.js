const { fetch } = window
const { h, Component } = window.preact

class DirectDemocracy extends Component {
    render () {
        return h('div', {}, [
            h('h2', null, 'Propositioner'),
            h(Propositions),
        ])
    }
}

class Propositions extends Component {
    constructor (props) {
        super(props)
        this.state = { loading: true }
        window._hack_triggerReload = () => {
            this.loadData()
        }
    }
    componentDidMount () {
        this.loadData()
    }
    loadData () {
        Promise.all([
            getJson('/propositions')
        ]).then(([propositions]) => {
            this.setState({ propositions, loading: false })
    })
    }
    render () {
        const { loading, propositions } = this.state

        if (loading) {
            return h('div', null, 'Loading...')
        }

        console.log(propositions[0])

        const propositionRows = propositions.reduce((mem, proposition) => {
            const propositionRow = h('tr', {class: 'proposition_row'}, [
                h('td', {colspan: '5'}, h('a', {'href': 'http:' + proposition.url}, `${proposition.title}`)),
                h('td', null, `${proposition.pub_date}`),
                h('td', {onClick: () => vote(proposition.prop_id, 1), class: 'upvote'}, 'Upvote'),
                h('td', {onClick: () => vote(proposition.prop_id, -1), class: 'downvote'}, 'Downvote'),
                h('td', null, proposition.up_votes - proposition.down_votes)
            ])
            return [...mem, propositionRow]
        }, [])

        return h('div', null,
            h('table', null, [
                ...propositionRows
            ])
        )
    }
}

window.preact.render(h('div', null, h(DirectDemocracy)), document.body)

function vote(document_id, vote) {
    post('/vote', {'document_id': document_id, 'vote': vote})
}

function post(url, payload) {
    console.info(payload)
    const body = JSON.stringify(payload)
    const headers = { 'Content-Type': 'application/json' }

    return fetch(url, { method: 'POST', body: body, headers: headers })
}

function postJson (url, payload) {
    return post(url, payload).then((res) => res.json())
}

function getJson (path) {
    return fetch(path).then(res => res.json())
}
