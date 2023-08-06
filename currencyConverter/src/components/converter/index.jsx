import { useEffect, useState } from "react";

import * as Yup from 'yup';
import { useFormik} from 'formik'

import { Container, Form } from 'react-bootstrap';

const SignupSchema = Yup.object().shape({
    rate:Yup.number().positive().required('Required'),
});

const Converter = () => {
    const [state, setState] = useState({});
    const [exchangeRate, setExchangeRate] = useState({
        currencyFrom : null,
        currencyTo : null,
    })

    const formik = useFormik({
        initialValues: {
            rate: '',
        },
        validationSchema: SignupSchema,
    });

    useEffect(() => {
        fetch('https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json')
        .then(res => res.json())
        .catch(error => console.error('Error fetching exchange rates', error))
        .then(data => {
            const loadRates = {};
            data.forEach(item => {
            loadRates[item.cc] = item.rate;
            });
            setState(loadRates)
        });
    }, [])

    const listCurrencies = () => {
        return Object.keys(state).sort().map(cc => (
            <option key={cc} value={cc}>{cc}</option>
        ));
    }

    const handleCurrencyChange = (e) => {
        const {name, value} = e.target;
        setExchangeRate((prevExchangeRate) => ({
            ...prevExchangeRate,
            [name]: value,
        }));
    }

    const conversionCurrency = () => {
        const {currencyFrom, currencyTo} = exchangeRate;
        if (currencyFrom && currencyTo) {
            const rate = parseFloat(formik.values.rate);
            if (!isNaN(rate) && !isNaN(state[currencyFrom]) && !isNaN(state[currencyTo])) {
                return ((rate / state[currencyFrom]) * state[currencyTo]).toFixed(2)
            }
        }
        return ''
    }

    return (
        <Container className="rounded d-flex flex-column align-items-center">
            <div className="d-flex">
                <Form.Control
                    style={{width:200}}
                    className="bg-light"
                    type="number"
                    placeholder="1"
                    name="rate"
                    value={formik.values.rate}
                    onChange={formik.handleChange}
                />
                <Form.Select
                    style={{width:100}}
                    className="bg-light"
                    name="currencyFrom"
                    onChange={handleCurrencyChange}
                >
                    {listCurrencies()}
                </Form.Select>
            </div>
            <div className="d-flex">
                <Form.Control
                    style={{width:200}}
                    className="bg-light"
                    type="text"
                    placeholder={conversionCurrency()}
                    readOnly
                />
                <Form.Select
                    style={{width:100}}
                    className="bg-light"
                    name="currencyTo"
                    onChange={handleCurrencyChange}
                >
                    {listCurrencies()}
                </Form.Select>
            </div>
        </Container>
    );
};

export default Converter;