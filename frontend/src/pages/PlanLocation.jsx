import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header.jsx';
import axios from 'axios';

import { useParams, useLocation } from 'react-router-dom';

import '../css/planLocation.css';

let apiaddress = `https://apis.data.go.kr/B551011/KorWithService1/areaBasedList1?serviceKey=${process.env.REACT_APP_API_KEY}&numOfRows=1000&pageNo=1&MobileOS=WIN&MobileApp=AppTest&listYN=Y&arrange=C&_type=json`
let apiaddress2 = `https://apis.data.go.kr/B551011/KorWithService1/detailWithTour1?serviceKey=${process.env.REACT_APP_API_KEY}&MobileOS=WIN&MobileApp=AppTest&_type=json&contentId=`

const { kakao } = window;
window.map = null;

function PlanLocation() {
  const listRef = useRef(null);
  const [barrierfreeInfo, setBarrierfreeInfo] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);

  const location = useLocation();

  // 지도에 표시된 마커 객체를 가지고 있을 배열입니다
  var markers = [];

  // 별도의 객체를 활용하여 마커와 관련 정보를 저장합니다
  const [markerInfoMap, setMarkerInfoMap] = useState({});

  const [overlayOpen, setOverlayOpen] = useState({});

  const [selectedItems, setSelectedItems] = useState([]); //선택한 관광지 요소

    const fetchData = async (areaCode) => {
      try {
        const api = `${apiaddress}&areaCode=${areaCode}`
        await axios.get(api).then((res) => {
          console.log(res.data)
          const data = res.data.response.body.items.item
          setBarrierfreeInfo(data);
          console.log(data);
        })
      } catch (e) {
        console.log(e)
      }
    }

  useEffect(() => {
  const searchParams = new URLSearchParams(location.search);
  const areaCode = searchParams.get('areaCode');
  fetchData(areaCode);

  }, [location]);

  useEffect(() => {

    if (barrierfreeInfo.length > 0 && window.map == null) {
      var container = document.getElementById('map'); //지도를 담을 영역의 DOM 레퍼런스
      var options = { //지도를 생성할 때 필요한 기본 옵션
        center: new kakao.maps.LatLng(37.5665, 126.9780), //지도의 중심좌표. y,x 순서로 적으면됨
        level: 7 //지도의 레벨(확대, 축소 정도)
      };

      const map = new kakao.maps.Map(container, options); //지도 생성 및 객체 리턴

      barrierfreeInfo.forEach((info) => {
        const { mapx, mapy, title, contentid, firstimage, addr1 } = info;
        const position = new kakao.maps.LatLng(parseFloat(mapy), parseFloat(mapx)); //카카오맵 LatLng는 y,x 식으로 넣어야함
        addMarker(map, position, title, contentid, firstimage, addr1);
      })
      window.map = map;
    }

    // 마커 오버레이 내부의 "+" 버튼에 대한 클릭 이벤트 리스너
    document.addEventListener('click', handleAddButtonClick);

    // 컴포넌트가 언마운트될 때 이벤트 리스너를 제거하는 클린업 함수
    return () => {
      document.removeEventListener('click', handleAddButtonClick);
    };

  }, [selectedItems, barrierfreeInfo, location]); // 빈 배열을 두번째 인자로 전달하여, 컴포넌트가 마운트될 때만 실행되도록 함.

  // 마커를 생성하고 지도위에 표시하는 함수입니다
  function addMarker(map, position, title, contentid, firstimage, addr1) {

    // 마커를 생성합니다
    var marker = new kakao.maps.Marker({
      position: position
    });

    // 마커를 클릭했을 때 마커 위에 표시할 오버레이를 생성합니다a
    var iwContent = `<div class="wrap">
      <div class="info">
          <div class="title">
              ${title}
          </div>
          <div class="body">
              <div class="img">
                  <img src="${firstimage}" width="73" height="70">
              </div>
              <div class="desc">
                  <div class="ellipsis">${addr1}</div>
                  <button id="add-button" data-contentid="${contentid}">+</button>
              </div>
          </div>
      </div>
    </div>`; // 오버레이에 표출될 내용으로 HTML 문자열이나 document element가 가능합니다

    // 오버레이를 생성합니다
    var overlay = new kakao.maps.CustomOverlay({
      content: iwContent,
      map: map,
      position: marker.getPosition()
    }, [barrierfreeInfo]);

    // 마커에 클릭이벤트를 등록합니다
    kakao.maps.event.addListener(marker, 'click', async function () {
      const markerInfo = markerInfoMap[contentid];
      if (markerInfo) {
        const { overlay } = markerInfo;
        const isOpen = overlay.getMap() !== null;

        // 현재 오버레이 상태에 따라 열고 닫음
        if (isOpen) {
          overlay.setMap(null);
        } else {
          try {
            // 오버레이 컨텐츠를 비동기적으로 업데이트
            const content = await fetchOverlayContent(contentid, title, addr1, firstimage);
            overlay.setContent(content);
            overlay.setMap(map);
          } catch (error) {
            console.log(error);
          }
        }

        // 선택된 마커를 업데이트
        setSelectedMarker(markerInfo);
      }
    });

    // 마커가 지도 위에 표시되도록 설정합니다
    marker.setMap(map);

    // 생성된 마커를 배열에 추가합니다
    markers.push(marker);

    // 생성된 마커와 관련 정보를 저장합니다
    markerInfoMap[contentid] = {
      marker: marker,
      overlay: overlay,
      title: title,
      contentid: contentid
    };

    //console.log(marker);
    overlay.setMap(null);
  }

  async function fetchOverlayContent(contentid, title, addr1, firstimage) {
    const api = `${apiaddress2}${contentid}`;

    try {
      const response = await fetch(api);
      if (!response.ok) {
        throw new Error('API request failed');
      }
  
      const data = await response.json();
      const {elevator, restroom, parking } = data.response.body.items.item[0];

      console.log(data.response.body.items.item);
      console.log(title);
  
      const content = `
        <div class="wrap">
          <div class="info">
            <div class="title">
              ${title}
            </div>
            <div class="body">
              <div class="img">
                <img src="${firstimage}" width="73" height="70">
              </div>
              <div class="desc">
                <div class="ellipsis">${addr1}</div>
                <div>주차장 : ${parking}</div>
                <div>엘리베이터 : ${elevator}</div>
                <div>화장실 : ${restroom}</div>
                <button id="add-button" data-contentid="${contentid}">+</button>
              </div>
            </div>
          </div>
        </div>
      `;
  
      return content;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // 리스트가 클릭되었을 때 작동할 함수
  const handleListClick = (info) => {
    console.log("list clicked");
    const { mapx, mapy, title, contentid } = info;
    const position = new kakao.maps.LatLng(
      parseFloat(mapy),
      parseFloat(mapx)
    );

    console.log(window.map);
    if (window.map) {
      console.log(window.map);
      window.map.setCenter(position); // map 객체가 유효한 경우에만 setCenter 함수 호출
    }

    if (selectedMarker) {
      const marker = selectedMarker;
      marker.overlay.setMap(null); // 기존 마커의 오버레이를 닫습니다.
    }

    const markerInfo = markerInfoMap[contentid];
    if (markerInfo) {
      const { marker } = markerInfo;
      // 마커의 클릭 이벤트를 강제로 호출
      kakao.maps.event.trigger(marker, 'click');
    }

  };

  // 오버레이의 + 버튼 클릭 이벤트 처리 함수
  function handleAddButtonClick(event) {
    event.stopPropagation(); // 이벤트 전파 중단

    const contentid = event.target.dataset.contentid;

    // 이미 선택된 항목 중에 동일한 contentid가 있는지 확인
    const isDuplicate = selectedItems.some((item) => item.contentid === contentid);

    console.log(isDuplicate);
    console.log(selectedItems);
    if (isDuplicate) {
      // 이미 선택된 항목 중에 동일한 contentid가 있다면 아무 작업을 수행하지 않음
      return;
    }

    // 선택된 마커 정보 가져오기
    const markerInfo = markerInfoMap[contentid];
    if (markerInfo) {
      const { contentid, title, overlay } = markerInfo;
      setSelectedItems((prevItems) => [...prevItems, { title, contentid, overlay }]); // 수정된 부분: overlay도 추가
    }
  }

  const handleCancelClick = (contentid) => {
    setSelectedItems((prevItems) =>
      prevItems.filter((item) => item.contentid !== contentid)
    );
  };

  var mapobject = (
    <div id="map" className="map"></div>
  );

  var listobject = (
    barrierfreeInfo.map((info) => (
      <li
        key={info.contentid}
        onClick={() => handleListClick(info)}
        className={selectedMarker && selectedMarker.title === info.title ? 'selected' : ''}
      >
        {info.title}
      </li>
    ))
  );

  const handleConfirmClick = () => {
    // item-container의 정보를 다른 API로 전송하는 로직을 작성합니다
    // 여기서 selectedItems 배열에 접근하여 필요한 데이터를 전송할 수 있습니다
    console.log("selectedItems");
    console.log(selectedItems);
    // 여기에 API 호출 또는 데이터 처리 로직을 추가합니다
  };

  var page = (
    <div className="container">
      <div id="listcontainer">
        <ul className="list" ref={listRef}>
          {listobject}
        </ul>
      </div>
      <div className="row">
        <div id="mapcontainer">
          {mapobject}
        </div>
        <div id="item3">
          {selectedItems.map((item) => (
            <div key={item.contentid} className="item-container">
              <div className="item-title">{item.title}</div>
              <button
                id="cancel-button"
                className="cancel-button"
                onClick={() => handleCancelClick(item.contentid)}
              >
                -
              </button>
            </div>
          ))}
            <button
              id="confirm-button"
              className="confirm-button"
              onClick={handleConfirmClick}
            >
              확정하기
            </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <Header />
      {page}
    </div>
  );
}

export default PlanLocation;