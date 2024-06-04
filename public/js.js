document.addEventListener('DOMContentLoaded', () => {
    const startDate = new Date('2024-04-19');
    const endDate = new Date('2024-05-19');
    const startSelectElement = document.getElementById('start-date-select');
    const endSelectElement = document.getElementById('end-date-select');
    const submitButton = document.getElementById('submit-btn');
    const priceArea = document.getElementById('price_area');
    let chart;

    function generateDateOptions(selectElement, startDate, endDate) {
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const option = document.createElement('option');
            const formattedDate = currentDate.toISOString().split('T')[0];
            option.value = formattedDate;
            option.textContent = formattedDate;
            selectElement.appendChild(option);
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }

    generateDateOptions(startSelectElement, startDate, endDate);
    generateDateOptions(endSelectElement, startDate, endDate);

    function padZero(number) {
        return number < 10 ? `0${number}` : number;
    }

    submitButton.addEventListener('click', async (e) => {
        e.preventDefault();
        const startDate = startSelectElement.value;
        const endDate = endSelectElement.value;

        if (startDate && endDate) {
            const startFormattedDate = `24/${padZero(new Date(startDate).getMonth() + 1)}/${padZero(new Date(startDate).getDate())}`;
            const endFormattedDate = `24/${padZero(new Date(endDate).getMonth() + 1)}/${padZero(new Date(endDate).getDate())}`;

            const response = await fetch(`/api/prices?start_date=${startFormattedDate}&end_date=${endFormattedDate}`);
            if (response.ok) {
                const data = await response.json();
                if (data.length > 0) {
                    const dates = data.map(item => item.date);
                    const prices = data.map(item => item.price);

                    if (chart) {
                        chart.destroy();
                    }

                    const ctx = document.getElementById('price-chart').getContext('2d');
                    chart = new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: dates,
                            datasets: [{
                                label: '當日黃豆價格',
                                data: prices,
                                borderColor: 'rgba(75, 192, 192, 1)',
                                borderWidth: 2,
                                fill: false
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                x: {
                                    type: 'category',
                                    title: {
                                        display: true,
                                        text: '日期'
                                    }
                                },
                                y: {
                                    title: {
                                        display: true,
                                        text: '價格'
                                    }
                                }
                            }
                        }
                    });
                } else {
                    priceArea.innerHTML = "<p>No data available</p>";
                }
            } else {
                const error = await response.text();
                priceArea.innerHTML = `<p>${error}</p>`;
            }
        }
    });
});
