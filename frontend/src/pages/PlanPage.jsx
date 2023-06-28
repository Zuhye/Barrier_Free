import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import Select from 'react-select';
import { Button, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/planpage.css';

function PlanPage() {
  const [startDate, setStartDate] = React.useState(new Date());
  const [endDate, setEndDate] = React.useState(new Date());
  const [selectedOption, setSelectedOption] = useState(null);
  const navigate = useNavigate();
  
  const handleStartDateChange = (date) => {
    setStartDate(date);
  }

  const handleEndDateChange = (date) => {
    setEndDate(date);
  }

  const handleLocationChange = ( selectedOption)=> {
    setSelectedOption(selectedOption);
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    const startDateString = startDate.toISOString().substring(0, 10);
    const endDateString = endDate.toISOString().substring(0, 10);
    console.log(`Selected dates: ${startDateString} - ${endDateString}`);
    console.log(`Selected location: ${selectedOption.value}`);
    const areaCode = selectedOption ? selectedOption.value : '';
    const url = `/PlanLocation?areaCode=${areaCode}&startDate=${startDateString}&endDate=${endDateString}`
    navigate(url);
  };


  const MyButton = () => {
    return (
      <div className="my-button">
        <Button variant="contained" color="primary" type="submit" onClick={handleSubmit}>
          다음
        </Button>
      </div>
    );
  };
  

  return (
    <div>
      <header>
        <Header/>
      </header>
      <main>
      <form>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        장소 : <LocationSelector onLoationChange={handleLocationChange}/>
      </div>
      <br/>
      <div className="calendar-container">
            <div className="calendar-wrapper">
            
              <label htmlFor="startDate">시작일</label>
              <Calendar
                id="startDate"
                name="startDate"
                value={startDate}
                onChange={handleStartDateChange}
              />
            </div>
            <div className="calendar-wrapper">
              <label htmlFor="endDate">종료일</label>
              <Calendar
                id="endDate"
                name="endDate"
                value={endDate}
                onChange={handleEndDateChange}
              />
            </div>
          </div>

        </form>
        <br />
        <MyButton/>
      </main>
      <footer>
      <Footer/>
      </footer>
    </div>
  );
}

function LocationSelector({onLoationChange}) {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleChange = (selectedOption) => {
    setSelectedOption(selectedOption);
    onLoationChange(selectedOption);
  };

  const options = [
    {value: '', label: '전체'},
    {value: 1, label: "서울특별시"},
    {value: 2, label: "인천광역시"},
    {value: 3, label: "대전광역시"},
    {value: 4, label: "대구광역시"},
    {value: 5, label: "광주광역시"},
    {value: 6, label: "부산광역시"},
    {value: 7, label: "울산광역시"},
    {value: 8, label: "세종특별자치시"},
    {value: 31, label: "경기도"},
    {value: 32, label: "강원도"},
    {value: 33, label: "충청북도"},
    {value: 34, label: "충청남도"},
    {value: 35, label: "경상북도"},
    {value: 36, label: "경상남도"},
    {value: 37, label: "전라북도"},
    {value: 38, label: "전라남도"},
    {value: 39, label: "제주"}
  ];

  return (
    <div className="location-selector">
      <Select
        value={selectedOption}
        options={options}
        onChange={handleChange}
        placeholder="시/도 선택"
      />
    </div>
  );
}

export default PlanPage; 