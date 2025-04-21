import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../App'
import { rest } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
    rest.post('http://127.0.0.1:8080/api/analyze', (req, res, ctx) =>
        res(ctx.status(200), ctx.json({ result: { suggestions: ['Use const instead of let'] } }))
    ),
    rest.post('http://127.0.0.1:8080/api/codeScore', (req, res, ctx) =>
        res(ctx.status(200), ctx.json({ result: '8.5' }))
    ),
    rest.post('http://127.0.0.1:8080/api/codeLinesQuality', (req, res, ctx) =>
        res(ctx.status(200), ctx.json({ result: ['1-2,red', '3,green'] }))
    )
)

beforeAll(() => server.listen())
afterAll(() => server.close())
afterEach(() => server.resetHandlers())

describe('App Integration Test', () => {
    beforeEach(() => {
        render(<App />)
    })

    it('shows validation message on empty code input', async () => {
        fireEvent.click(screen.getByText('Validate Code'))
        expect(screen.getByText('Code cannot be empty!')).toBeInTheDocument()
    })

    it('analyzes code and displays suggestions', async () => {
        fireEvent.change(screen.getByPlaceholderText('Paste your code here...'), {
            target: { value: 'let a = 5;' }
        })
        fireEvent.click(screen.getByText('Analyze Code'))

        await waitFor(() =>
            expect(screen.getByText('Analysis complete!')).toBeInTheDocument()
        )

        expect(screen.getByText('Suggestions:')).toBeInTheDocument()
        expect(screen.getByText(/Use const/)).toBeInTheDocument()
    })

    it('displays code score result in dialog', async () => {
        fireEvent.change(screen.getByPlaceholderText('Paste your code here...'), {
            target: { value: 'let a = 5;' }
        })
        fireEvent.click(screen.getByText('Kodo kokybės įvertinimas\(0-10\)'))

        await waitFor(() => expect(screen.getByText('8.5')).toBeInTheDocument())
    })

    it('displays colored code viewer with correct line colors', async () => {
        fireEvent.change(screen.getByPlaceholderText('Paste your code here...'), {
            target: { value: 'line1\nline2\nline3' }
        })
        fireEvent.click(screen.getByText('Kodo eilučių kokybė'))

        await waitFor(() => {
            const redLine = screen.getByText('line1')
            expect(redLine).toHaveStyle('background-color: red')

            const greenLine = screen.getByText('line3')
            expect(greenLine).toHaveStyle('background-color: green')
        })
    })
})
